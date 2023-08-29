import { Person } from "services/person_service";
import axios from "axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

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
    location?: string;
}

type CreateEventType = Omit<Event, "token" | "reported_by"> & {
    quantity: number;
};

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
            queryClient.cancelQueries(["locations"]);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["leaderboardData"]);
            queryClient.invalidateQueries(["locations"]);
        },
    });
    return mutation;
};

export const useAllLocations = () => {
    const _get = async () => {
        const res = await axios.get<{ locations: string[] }>(
            "/api/get_all_locations",
        );
        return res.data.locations;
    };
    const query = useQuery(["locations"], _get);
    return query;
};
