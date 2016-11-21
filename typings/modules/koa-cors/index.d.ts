declare module "koa-cors" {
    interface RequestHandler {
        (next: any): any
    }

    interface CORSOptions {
        origin?: string|boolean;
        expose?: string|string[];
        maxAge?: number;
        credentials?: boolean;
        methods?: string|string[];
        headers?: string|string[];
    }

    interface KoaCORS {
        (options?: CORSOptions): RequestHandler
    }

    const cors:KoaCORS;
    export = cors;
}

