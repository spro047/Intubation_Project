"""
This file is kept for reference. The Streamlit frontend has been replaced
by a Next.js dashboard at /frontend.

Run the new dashboard:
  cd frontend
  npm install
  npm run dev

Or via Docker Compose:
  docker-compose up --build
"""

import streamlit as st
import requests
import json

API_URL = "http://localhost:8000"

st.set_page_config(page_title="Airway Assessment Tool (Legacy)", layout="wide")
st.title("🫁 Legacy Streamlit Dashboard")
st.warning(
    "This Streamlit frontend is deprecated. "
    "Use the new Next.js dashboard at `/frontend` or via Docker Compose."
)

st.info("""
### New Dashboard
```bash
cd frontend
npm install
npm run dev
```
""")
