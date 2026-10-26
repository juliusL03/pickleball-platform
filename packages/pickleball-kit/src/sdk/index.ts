export interface GraphQLClientOptions {
  url: string;
  getToken?: () => string | null | undefined;
  fetchImpl?: typeof fetch;
}

export interface GraphQLErrorPayload {
  message: string;
  extensions?: Record<string, unknown>;
  path?: (string | number)[];
}

export class GraphQLClientError extends Error {
  errors: GraphQLErrorPayload[];

  constructor(errors: GraphQLErrorPayload[]) {
    super(errors[0]?.message ?? 'GraphQL request failed');
    this.name = 'GraphQLClientError';
    this.errors = errors;
  }

  get code(): string | undefined {
    return this.errors[0]?.extensions?.code as string | undefined;
  }
}

export class GraphQLClient {
  private readonly url: string;
  private readonly getToken?: () => string | null | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GraphQLClientOptions) {
    this.url = options.url;
    this.getToken = options.getToken;
    const fetchImpl = options.fetchImpl ?? fetch;
    this.fetchImpl = (input, init) => fetchImpl(input, init);
  }

  async request<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    variables?: TVariables,
  ): Promise<TData> {
    const token = this.getToken?.();
    const response = await this.fetchImpl(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = (await response.json()) as {
      data?: TData;
      errors?: GraphQLErrorPayload[];
    };

    if (payload.errors?.length) {
      throw new GraphQLClientError(payload.errors);
    }
    if (!payload.data) {
      throw new GraphQLClientError([{ message: 'Empty GraphQL response' }]);
    }
    return payload.data;
  }
}

export function createGraphQLClient(options: GraphQLClientOptions): GraphQLClient {
  return new GraphQLClient(options);
}
