import React, { useState, useRef } from "react";
import { Box, Text, useInput, useApp } from "ink";

interface AssistantMsg {
  content: string;
  model: string;
}

export function App({ initialPrompt }: { initialPrompt?: string }) {
  const { exit } = useApp();
  const [history, setHistory] = useState<string[]>([]);
  const [assistants, setAssistants] = useState<AssistantMsg[]>([]);
  const [status, setStatus] = useState<"idle" | "thinking">(initialPrompt ? "thinking" : "idle");
  const [streamingText, setStreamingText] = useState("");
  const [streamingModel, setStreamingModel] = useState("");
  const [sessionTokens, setSessionTokens] = useState(0);
  const [inputLine, setInputLine] = useState("");

  const statusRef = useRef(status);
  statusRef.current = status;
  const historyRef = useRef(history);
  historyRef.current = history;
  const assistantsRef = useRef(assistants);
  assistantsRef.current = assistants;

  const buildMessages = () => {
    const msgs: { role: "user" | "assistant"; content: string }[] = [];
    let aiIdx = 0;
    for (const h of historyRef.current) {
      msgs.push({ role: "user", content: h });
      if (aiIdx < assistantsRef.current.length) {
        msgs.push({ role: "assistant", content: assistantsRef.current[aiIdx].content });
        aiIdx++;
      }
    }
    return msgs;
  };

  useInput((_input, key) => {
    if (key.ctrl && _input === "\x03") { exit(); return; }
    if (statusRef.current === "thinking") return;
    if (key.return && inputLine.trim()) {
      const text = inputLine.trim();
      setInputLine("");
      setHistory(prev => [...prev, text]);
      startStream(text);
      return;
    }
    if (key.backspace || key.delete) {
      setInputLine(prev => prev.slice(0, -1));
      return;
    }
    if (inputLine.length < 500 && !key.ctrl && !key.meta && !key.shift) {
      setInputLine(prev => prev + _input);
    }
  });

  const startStream = async (text: string) => {
    setStatus("thinking");
    setStreamingText("");

    const { streamResponse } = await import("./llm");
    const { tools } = await import("./tools");
    const { loadConfig } = await import("./config");
    const config = loadConfig();

    let currentText = "";
    try {
      for await (const event of streamResponse(buildMessages(), tools, config)) {
        if (event.type === "text-delta") {
          currentText += event.text;
          setStreamingText(currentText);
        } else if (event.type === "finish") {
          setStreamingModel(event.model);
          setSessionTokens(prev => prev + event.usage.totalTokens);
        } else if (event.type === "error") {
          currentText += "\n  X " + event.message;
          setStreamingText(currentText);
        }
      }
    } catch (e: any) {
      currentText += "\n  X " + e.message;
      setStreamingText(currentText);
    }

    const finalMsg = currentText;
    if (finalMsg) {
      setAssistants(prev => [...prev, { content: finalMsg, model: streamingModel }]);
    }
    setStreamingText("");
    setStreamingModel("");
    setStatus("idle");
  };

  const sp = sessionTokens;
  const lim = 100000;
  const pct = Math.min(100, (sp / lim) * 100);
  const barW = 8;
  const filled = Math.min(barW, Math.max(1, Math.ceil((pct / 100) * barW)));
  const bar = "#".repeat(filled) + "-".repeat(Math.max(0, barW - filled));
  const barColor: "green" | "yellow" | "red" =
    pct < 50 ? "green" : pct < 80 ? "yellow" : "red";

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">{"<>"} ProCode</Text>
        <Text color="green"> FREE</Text>
        <Text dimColor> |</Text>
        <Text color="green">{"-".repeat(14)}</Text>
        <Text dimColor> |</Text>
        <Text color={barColor}>{bar} {sp < 1000 ? sp + "B" : (sp / 1000).toFixed(0) + "K"}</Text>
     </Box>
      <Box flexDirection="column" flexGrow={1}>
        {history.map((h, i) => (
          <Box key={"h" + i} flexDirection="column">
            <Text>
              <Text color="cyan">{"->"}</Text> {h}
           </Text>
            {i < assistants.length && (
              <Text>
                <Text color="green">{"<>"}</Text> {assistants[i].content.slice(0, 1000)}
             </Text>
            )}
         </Box>
        ))}
        {streamingText ? (
          <Text>
            <Text color="green">{"->"}</Text> {streamingText.slice(0, 2000)}
         </Text>
        ) : null}
     </Box>
      <Box>
        <Text color="cyan">{"->"}</Text>
        <Text>
          {inputLine}
       </Text>
     </Box>
   </Box>
  );
}
