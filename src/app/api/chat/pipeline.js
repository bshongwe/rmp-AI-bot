import { pipeline } from "@xenova/transformers";


let PipelineSingleton;

const createPipeline = () => {
    return class PipelineSingleton {
        static task = 'feature-extraction';
        static model = 'Xenova/all-MiniLM-L6-v2';
        static instance = null;

        static async getInstance(progress_callback = null) {
            console.log("\n\n getting instance of xenova")
            if (!this.instance) {
                try {
                    this.instance = await pipeline(this.task, this.model, { progress_callback });
                } catch (error) {
                    console.error("Error loading pipeline:", error);
                    throw new Error("Failed to load pipeline");
                }
            }
            return this.instance;
        }
    }
}

if (process.env.NODE_ENV !== 'production') {
    if (!global.PipelineSingleton) {
        global.PipelineSingleton = createPipeline();
    }
    PipelineSingleton = global.PipelineSingleton;
} else {
    PipelineSingleton = createPipeline();
}

export default PipelineSingleton;
