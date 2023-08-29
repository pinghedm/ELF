import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePerson, useAllPersons, Person } from "services/person_service";
import { Event, EventType } from "services/event_service";
import { ColumnsType } from "antd/es/table";
import { Table, Spin, Typography } from "antd";
import { DateTime } from "luxon";

export interface PersonDetailsProps {}

const PersonDetails = ({}: PersonDetailsProps) => {
    const { token } = useParams();
    const { data: person } = usePerson(token);
    const { data: people } = useAllPersons();
    const personByToken: Record<string, Person> = useMemo(
        () =>
            (people ?? []).reduce(
                (memo, next) => ({ ...memo, [next.token]: next }),
                {},
            ),
        [people],
    );
    const columns: ColumnsType<Event> = [
        {
            title: "",
            key: "created",
            render: (e) =>
                DateTime.fromISO(e.created, { zone: "utc" })
                    .toLocal()
                    .toLocaleString(DateTime.DATETIME_SHORT),
            sorter: (e1, e2) => (e1.created < e2.created ? -1 : 1),
        },
        {
            title: "Type",
            key: "type",
            render: (e) => EventType[e.event_type],
            sorter: (e1, e2) => (e1.event_type < e2.event_type ? -1 : 1),
        },
        {
            title: "Other Person",
            key: "secondary",
            render: (e) => {
                const otherPersonToken =
                    e.primary_person_token === person?.token
                        ? e.secondary_person_token
                        : e.primary_person_token;
                return personByToken?.[otherPersonToken]?.name ?? "";
            },
        },
        {
            title: "Reported By",
            key: "reported",
            render: (e) => personByToken?.[e.reported_by]?.name ?? "",
        },
        {
            title: "Location",
            key: "location",
            dataIndex: "location",
            sorter: (e1, e2) =>
                (e1?.location ?? "").localeCompare(e2?.location ?? ""),
        },
    ];
    if (!person) {
        return <Spin />;
    }
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <Typography.Title level={4}>
                Details For {person.name}
            </Typography.Title>
            <Table
                scroll={{ x: "max-content" }}
                style={{ height: "100%", width: "100%" }}
                columns={columns}
                dataSource={(person?.events ?? []).map((e) => ({
                    ...e,
                    key: e.token,
                }))}
                pagination={{ hideOnSinglePage: true }}
            />
        </div>
    );
};

export default PersonDetails;
