import "core-js/features/map";
import "core-js/features/set";
import React, { useState } from 'react';
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

global.scheme = {
    scheme: undefined,
    beginning: false,
}
// Проверка подписи
const [activePanel, setActivePanel] = useState();

async function firstInstr() {
    const instr = await bridge.send("VKWebAppStorageGetKeys", {"count": 1, "offset": 0});
    if (instr.keys[0] === 'firstInstruction') {
        global.scheme.beginning = true
        await setActivePanel('home')
    }
    else {
        await setActivePanel('instruction')
    }
}

firstInstr();

// Init VK  Mini App
bridge.send("VKWebAppInit");
bridge.subscribe(({ detail: { type, data }}) => {
    if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        console.log(schemeAttribute.value);
        if(schemeAttribute.value === 'bright_light'){
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark"});
        }else{
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light"});
        }
        document.body.attributes.setNamedItem(schemeAttribute);
        global.scheme.scheme = schemeAttribute.value;
    }
});

import("./eruda").then(({ default: eruda }) => {}); //runtime download

ReactDOM.render(<App />, document.getElementById("root"));