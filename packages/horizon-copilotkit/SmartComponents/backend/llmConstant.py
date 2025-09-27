import asyncio
import os
from dotenv import load_dotenv
import openai

load_dotenv()
api_key=os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"]=api_key
os.environ["OPENAI_API_BASE"]="https://api.chatanywhere.tech/v1"
from langchain.chat_models import init_chat_model
llm=init_chat_model("gpt-4o-mini",model_provider="openai")





