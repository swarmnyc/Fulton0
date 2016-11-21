import { IRoute } from '../framework';

export abstract class APIRoute implements IRoute {
  urlPattern: string
  method: string
  handler: (next: any) => any
}

