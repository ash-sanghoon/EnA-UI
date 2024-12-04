from typing import Literal
import base64
from pathlib import Path
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import MessagesState, StateGraph, START, END
from anthropic import AnthropicVertex

class State(MessagesState):
    summary: str

class Claude:
    def __init__(self):
        LOCATION = "us-east5"
        PROJECT_ID = "loader-434606"
        self.client = AnthropicVertex(region=LOCATION, project_id=PROJECT_ID)
    
    def invoke(self, messages):
        # 메시지 변환
        processed_messages = []
        for msg in messages:
            if isinstance(msg, (HumanMessage, SystemMessage)):
                content = []
                # 텍스트 처리
                if msg.content:
                    if isinstance(msg.content, str):
                        content.append({
                            "type": "text",
                            "text": msg.content
                        })
                    # 이미지와 텍스트가 함께 있는 경우
                    elif isinstance(msg.content, list):
                        for item in msg.content:
                            if isinstance(item, dict):
                                if item.get("type") == "image":
                                    # 로컬 이미지 파일 처리
                                    image_path = Path(item["path"])
                                    with open(image_path, "rb") as img_file:
                                        image_data = base64.b64encode(img_file.read()).decode("utf-8")
                                    content.append({
                                        "type": "image",
                                        "source": {
                                            "type": "base64",
                                            "media_type": f"image/{image_path.suffix[1:]}",
                                            "data": image_data,
                                        }
                                    })
                            elif isinstance(item, str):
                                content.append({
                                    "type": "text",
                                    "text": item
                                })
                
                processed_messages.append({
                    "role": "user" if isinstance(msg, HumanMessage) else "system",
                    "content": content
                })

        response = self.client.messages.create(
            max_tokens=8000,
            messages=processed_messages,
            model="claude-3-5-sonnet-v2@20241022",
        )
        return response.content[0].text

memory = MemorySaver()
model = Claude()

def call_model(state: State):
    summary = state.get("summary", "")
    
    if summary:
        system_message = SystemMessage(content=f"Summary of conversation earlier: {summary}")
        messages = [system_message] + state["messages"]
    else:
        messages = state["messages"]
    
    response = model.invoke(messages)
    return {"messages": [AIMessage(content=response)]}

def should_continue(state: State) -> Literal["summarize_conversation", END]:
    if len(state["messages"]) > 6:
        return "summarize_conversation"
    return END

def summarize_conversation(state: State):
    summary = state.get("summary", "")
    summary_message = (
        f"This is summary of the conversation to date: {summary}\n\n"
        "Extend the summary by taking into account the new messages above:"
        if summary
        else "Create a summary of the conversation above:"
    )
    
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)
    
    return {"summary": response, "messages": state["messages"][-2:]}

workflow = StateGraph(State)
workflow.add_node("conversation", call_model)
workflow.add_node("summarize_conversation", summarize_conversation)
workflow.add_edge(START, "conversation")
workflow.add_conditional_edges(
    "conversation",
    should_continue,
    {
        "summarize_conversation": "summarize_conversation",
        END: END
    }
)
workflow.add_edge("summarize_conversation", "conversation")

app = workflow.compile(checkpointer=memory)

def chat(message, config: dict):
    """
    메시지를 처리하는 함수입니다.
    message: 문자열 또는 [{"type": "image", "path": "이미지경로"}, "텍스트 메시지"] 형식의 리스트
    """
    input_message = HumanMessage(content=message)
    for event in app.stream({"messages": [input_message]}, config, stream_mode="updates"):
        for k, v in event.items():
            for m in v["messages"]:
                if isinstance(m, AIMessage):
                    return m.content

config = {"configurable": {"thread_id": "1"}}

# 사용 예시 - 텍스트만
print(chat("안녕하세요. 저는 Bob입니다.", config))

# 사용 예시 - 이미지와 텍스트
message_with_image = [
    {"type": "image", "path": "/home/infocz/eun/07-Samsung E&A/무제 2.png"},
    "이 이미지에 대해 설명해주세요."
]
print(chat(message_with_image, config))
