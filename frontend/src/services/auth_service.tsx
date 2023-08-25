import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Person } from "services/person_service";
import axios from "axios";
export const useCurrentUser = () => {
    const _get = async () => {
        try {
            const res = await axios.get<Person>("/auth/get_current_user");
            return res.data;
        } catch {
            return undefined;
        }
    };

    const query = useQuery(["currentUser"], _get, {
        refetchOnWindowFocus: false,
    });
    return query;
};

export const useLogin = () => {
    const _post = async (name: string, password: string) => {
        const res = await axios.post("/auth/login", { name, password });
        return res.data;
    };
    const queryClient = useQueryClient();

    const mutation = useMutation(
        ({ name, password }: { name: string; password: string }) =>
            _post(name, password),
        {
            onMutate: () => {
                queryClient.cancelQueries(["currentUser"]);
            },
            onSettled: () => {
                queryClient.invalidateQueries(["currentUser"]);
            },
        },
    );
    return mutation;
};

export const useEnsureCSRF = () => {
    const _get = async () => {
        const res = await axios.get("/auth/get_csrf");
        return res.data;
    };

    const query = useQuery(["CSRF"], _get, {
        cacheTime: Infinity,
        staleTime: Infinity,
    });
    return query;
};

export const logout = async () => {
    await axios.get("/auth/logout");
    window.location.reload();
};
