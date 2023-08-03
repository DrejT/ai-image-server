const engineId = 'stable-diffusion-v1-5'
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
const apiKey = process.env.STABILITY_API_KEY
declare var fetch: typeof import('undici').fetch;

export async function generate(prompt:String){
    const response = await fetch(
        `${apiHost}/v1/generation/${engineId}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: String(prompt),
              },
            ],
            cfg_scale: 7,
            clip_guidance_preset: 'FAST_BLUE',
            height: 512,
            width: 512,
            samples: 1,
            steps: 30,
          }),
        }
      );
      try {
      const obj:any = await response.json();
      return String(obj.artifacts[0].base64);
      } catch (err) {console.error(err);}
}