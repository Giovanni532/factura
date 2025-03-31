import { useState, useCallback } from "react";

type ActionState<TOutput> = {
    data?: TOutput;
    error?: string;
    isLoading: boolean;
};

type UseActionOptions<TOutput> = {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
};

export const useAction = <TInput, TOutput>(
    action: (data: TInput) => Promise<TOutput>,
    options: UseActionOptions<TOutput> = {}
) => {
    const [state, setState] = useState<ActionState<TOutput>>({
        data: undefined,
        error: undefined,
        isLoading: false,
    });

    const execute = useCallback(
        async (input: TInput) => {
            setState((current) => ({
                ...current,
                isLoading: true,
                error: undefined,
                data: undefined,
            }));

            try {
                const data = await action(input);

                setState({
                    data,
                    isLoading: false,
                    error: undefined,
                });

                options.onSuccess?.(data);
                return data;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";

                setState({
                    error: errorMessage,
                    isLoading: false,
                    data: undefined,
                });

                options.onError?.(errorMessage);
                return undefined;
            } finally {
                options.onComplete?.();
            }
        },
        [action, options]
    );

    return {
        ...state,
        execute,
    };
}; 