# Data & State Modeling for Style-alyst

This document defines the JSON schemas that power the interactions between the frontend React app and the backend API services.

## 1. Chat Message Model
This represents the structure of each message stored in the React state and rendered in the Chatbot window.

```json
{
  "id": "string (uuid)",
  "role": "user | bot",
  "text": "string",
  "attachedImage": "string (base64 or URL) | null", 
  "timestamp": "string (ISO 8601)",
  "outfitRecommendation": "OutfitData | null"
}
```

## 2. "Complete the Look" (OutfitData) Model
This is the core output expected from the Agentic AI when it builds a cohesive outfit.

```json
{
  "outfitId": "string (uuid)",
  "occasion": "string",
  "stylistReasoning": "string",
  "totalPriceEstimate": "number",
  "items": {
    "top": {
      "productId": "string",
      "name": "string",
      "brand": "string",
      "price": "number",
      "imageUrl": "string",
      "productUrl": "string"
    },
    "bottom": {
      "productId": "string",
      "name": "string",
      "brand": "string",
      "price": "number",
      "imageUrl": "string",
      "productUrl": "string"
    },
    "shoes": {
      "productId": "string",
      "name": "string",
      "brand": "string",
      "price": "number",
      "imageUrl": "string",
      "productUrl": "string"
    },
    "accessory": {
      "productId": "string",
      "name": "string",
      "brand": "string",
      "price": "number",
      "imageUrl": "string",
      "productUrl": "string"
    }
  }
}
```

## 3. Image Upload Request Payload
This defines what the frontend will send to our API routes when a user uploads a closet or inspiration photo.

```json
{
  "currentPdpContext": {
    "productId": "string",
    "name": "string"
  },
  "uploadedImageBase64": "string",
  "userQuery": "string"
}
```
