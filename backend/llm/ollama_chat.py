"""
Agentic chat loop dùng OpenAI-compatible API (Ollama).
Ollama chạy tại http://localhost:11434 với endpoint /v1.
"""
import json
import os
import re
from openai import OpenAI
from typing import Optional, Any


def _get_ollama_client() -> OpenAI:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    return OpenAI(base_url=base_url, api_key="ollama")


_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _is_qwen3(model: str) -> bool:
    return "qwen3" in (model or "").lower()


def _prepare_system_prompt(system_prompt: str, model: str) -> str:
    """qwen3 mặc định bật 'thinking'. Thêm /no_think để chatbot trả lời gọn, sạch."""
    if _is_qwen3(model):
        return system_prompt + "\n/no_think"
    return system_prompt


def _strip_think(text: str) -> str:
    """Lọc bỏ khối <think>...</think> nếu model vẫn sinh ra (safety net)."""
    return _THINK_RE.sub("", text or "").strip()


def _tools_to_openai(tools: list) -> list:
    """Chuyển tool definitions (input_schema) sang OpenAI function format."""
    result = []
    for t in tools:
        result.append({
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("input_schema", {"type": "object", "properties": {}}),
            },
        })
    return result


def run_chat(
    message: str,
    system_prompt: str,
    tools: list,
    model: str,
    db: Any,
    current_user: Any,
    execute_tool_fn: Any,
    max_rounds: int = 5,
) -> tuple[str, list, str]:
    """
    Chạy agentic loop với Ollama.
    Returns: (final_response, tools_called_log, context_injected)
    """
    from llm import defenses
    if execute_tool_fn is None:
        from llm.tools import execute_tool as execute_tool_fn

    # Tool đọc dữ liệu ngoài (untrusted) — kết quả cần đánh dấu khi defense bật
    untrusted_tools = ("get_product_comments", "get_product_info")

    client = _get_ollama_client()
    openai_tools = _tools_to_openai(tools)

    messages = [
        {"role": "system", "content": _prepare_system_prompt(system_prompt, model)},
        {"role": "user", "content": message},
    ]
    tools_called_log = []
    context_injected = ""

    for _ in range(max_rounds):
        kwargs = {
            "model": model,
            "messages": messages,
            "max_tokens": 1024,
            # Ổn định ngôn ngữ: model dòng Qwen dễ trộn ký tự Hán/tiếng Anh khi temperature cao.
            # Hạ temperature + top_p giúp model bám tiếng Việt theo system prompt.
            "temperature": 0.3,
            "top_p": 0.8,
        }
        if openai_tools:
            kwargs["tools"] = openai_tools
            kwargs["tool_choice"] = "auto"

        response = client.chat.completions.create(**kwargs)
        choice = response.choices[0]
        msg = choice.message

        # Không có tool call → xong
        if not msg.tool_calls:
            break

        # Xử lý tool calls
        messages.append(msg)
        tool_results = []

        for tc in msg.tool_calls:
            tool_name = tc.function.name
            try:
                tool_input = json.loads(tc.function.arguments)
            except Exception:
                tool_input = {}

            result_str = execute_tool_fn(tool_name, tool_input, db, current_user)
            tools_called_log.append({"name": tool_name, "input": tool_input})

            if tool_name in untrusted_tools:
                # log nguyên văn để verify injection
                context_injected += f"\n[{tool_name} product {tool_input.get('product_id')}]:\n{result_str}"
                # 2.6.2 — đánh dấu untrusted cho phần gửi lại LLM
                result_str = defenses.wrap_untrusted(result_str)
                print("--- [DEBUG] Context sent to LLM: ---")
                print(result_str)
                print("------------------------------------")
            tool_results.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result_str,
            })

        messages.extend(tool_results)

    final_text = _strip_think(msg.content or "")
    return final_text, tools_called_log, context_injected


def simple_completion(system_prompt: str, user_content: str, model: str) -> str:
    """Single-shot completion (không tool) — dùng cho endpoint /summary với Ollama."""
    client = _get_ollama_client()
    response = client.chat.completions.create(
        model=model,
        max_tokens=512,
        temperature=0.3,
        top_p=0.8,
        messages=[
            {"role": "system", "content": _prepare_system_prompt(system_prompt, model)},
            {"role": "user", "content": user_content},
        ],
    )
    return _strip_think(response.choices[0].message.content or "")
