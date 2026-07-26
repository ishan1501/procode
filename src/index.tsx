#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./ui";

const initialPrompt = process.argv.slice(2).join(" ") || undefined;
const instance = render(<App initialPrompt={initialPrompt} />);
await instance.waitUntilExit();
