import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
export interface Person {
    name: string;
    token: string;
}

export const useAllPersons = () => {
    const _get = async () => {
        const res = await axios.get<{ people: Person[] }>(
            "/api/get_all_persons",
        );
        return res.data.people;
    };

    const query = useQuery(["allPeople"], _get);
    return query;
};

export const useCreatePerson = () => {
    const _post = async (name: string) => {
        const res = await axios.post<Person>("/api/create_person", { name });
        return res.data;
    };
    const queryClient = useQueryClient();
    const mutation = useMutation((name: string) => _post(name), {
        onMutate: () => {
            queryClient.cancelQueries(["allPeople"]);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["allPeople"]);
        },
    });
    return mutation;
};
