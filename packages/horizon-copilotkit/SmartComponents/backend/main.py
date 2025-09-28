from typing import Any, Dict, List
from fastapi import Body, FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from pydantic import BaseModel

from llmConstant import llm
import logging

from utils.componentRegistry2 import ComponentRegistration, ComponentRegistry2

from utils.llmService2 import LLMService2

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


registry = ComponentRegistry2()
@app.post("/api/register")
def register_component(component: ComponentRegistration):
    # 将组件信息添加到注册表
    registry.register_component(component)
    # print("后端注册的组件：register",registry.get_all_components())
    return {"status":"success"}

@app.post("/api/execute")
async def executeLLM(user_input:str=Body(...,embed=True)):
    llm_service2=LLMService2(registry)
    prompt=await llm_service2.create_llm_prompt(user_input)
    response_text=await llm.ainvoke(prompt)
    response=await llm_service2.process_llm_response(response_text.content)
    print(response)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)