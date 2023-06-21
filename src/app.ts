import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT;
const myApiKey = process.env.API_KEY;

const ai = new OpenAIApi(new Configuration({
    apiKey: myApiKey,
}));

app.listen(port, () => {
    console.log(`server is listening on port - ${port}`);
})

app.get("/healthCheck", (_, res: Response) => {
    res.send("OK")
});

app.post('/incoming-message', async (req: Request<{}, {}, { message: string }>, res: Response) => {
    const { message } = req.body;

    try {
        const result = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        })
        // console.log(result);
        return res.status(200).send(result.data.choices[0].message!.content);
    } catch (error: any) {
        // console.log(error.response.statusText);
        if (error.message.includes('429')) {
            console.log('yes')
            return res.status(400).send({ error: 'You have exceeded the usage limit' });
        }
    }
});

