import { createContext, useState } from "react";
import runChat from "../config/convoAI";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };
   
  const newChat=()=>{
    setLoading(false)
    setShowResult(false)
  }

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    // Ensure prompt is string
    const textToSend = typeof prompt === "string" ? prompt : input;
    if (!textToSend) {
      setLoading(false);
      return;
    }

    // Track prompts
    setPrevPrompts((prev) => {
  if (!prev.includes(textToSend)) {
    return [textToSend,...prev];
  }
  return prev;
});
    setRecentPrompt(textToSend);

    let response;
    try {
      response = await runChat(textToSend);
    } catch (err) {
      console.error("Error in runChat:", err);
      setLoading(false);
      return;
    }

    if (!response) {
      setLoading(false);
      return;
    }

    // Format response: **bold**, *line breaks*
    let responseArray = response.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i % 2 === 1) {
        newResponse += "<b>" + responseArray[i] + "</b>";
      } else {
        newResponse += responseArray[i];
      }
    }

    let newResponse2 = newResponse.split("*").join("</br>");
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      delayPara(i, newResponseArray[i] + " ");
    }

    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
