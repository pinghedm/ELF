import { Person } from "services/person_service";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export enum EventType {
    KILL = 1,
    ASSIST = 2,
    OBSERVE = 3,
}

export interface Event {
    event_type: EventType;
    reported_by: Person;
    primary_person_token: string;
    secondary_person_token?: string;
    token: string;
}

type CreateEventType = Omit<Event, "token" | "reported_by">;

export const useCreateNewEvent = () => {
    const _post = async (event: CreateEventType) => {
        const res = await axios.post("/api/create_event", event);
        return res.data;
    };
    const queryClient = useQueryClient();
    // TODO i assume blank out the events list query

    const mutation = useMutation((event: CreateEventType) => _post(event), {
        onMutate: () => {
            queryClient.cancelQueries(["leaderboardData"]);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["leaderboardData"]);
        },
    });
    return mutation;
};
