import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Person } from "services/person_service";
export interface LeaderboardRow {
    person: Person;
    kills: number;
    assists: number;
    observes: number;
}

export const useLeaderboardData = () => {
    const _get = async () => {
        const res = await axios.get<LeaderboardRow[]>(
            "/api/get_leaderboard_data",
        );
        return res.data;
    };

    const query = useQuery(["leaderboardData"], _get);
    return query;
};
