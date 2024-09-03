import axios from 'axios'
import { jsonrepair } from 'jsonrepair';
import store from '../../store';

export default class Api {
    static cleanJsonData(data: string): string {
        let buffer = data.trim();
        const sIdx = buffer.indexOf('{');
        const eIdx = buffer.lastIndexOf('}');

        if(sIdx < 0 || eIdx >= buffer.length) {
            return data;
        }

        buffer = buffer.substring(sIdx, eIdx+1);

        return jsonrepair(buffer);
    }
    static async fetchData(userPrompt: string) {
        const API = store.api;
        const Key = store.apiKey;

        if(!userPrompt || userPrompt.trim().length === 0) {
            throw new Error('Empty prompt');
        }

        const prompt = store.generatePrompt(userPrompt);
        const response = await axios.post(
            `${API}`,
            {
                "model": "chatgpt-4o-latest",
                "messages": [{role: "user", content: prompt}],
                "temperature": 0.7,
                "max_tokens": 2048,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": false
            },
            {
                headers: {
                    "Authorization": `Bearer ${Key}`,
                    "Content-Type": "application/json"
                }
            }
        )

        // console.log(response.data.choices[0].message.content);
        const gptResponse = response.data.choices[0].message.content;
        const gptCleanResponse = this.cleanJsonData(gptResponse);

        return JSON.parse(gptCleanResponse);
    }
}

