import React, { useState, useMemo } from "react";
import { Modal, Typography, Input, Button, Select, Popover, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Event, EventType, useCreateNewEvent } from "services/event_service";
import { useAllPersons, useCreatePerson } from "services/person_service";
import {
    useLeaderboardData,
    LeaderboardRow,
} from "services/leaderboard_service";
import { ColumnsType } from "antd/es/table";
import styled from "styled-components";

const AddEventModal = ({
    open,
    onCancel,
}: {
    open: boolean;
    onCancel: () => void;
}) => {
    const [newEvent, setNewEvent] = useState<
        Omit<Event, "token" | "reported_by">
    >({
        event_type: 1,
        primary_person_token: "",
    });

    const event_options = useMemo(() => {
        const options = [];
        for (const val in Object.keys(EventType)) {
            if (typeof EventType[val] !== "string") {
                continue;
            }
            options.push({
                value: Number(val),
                label:
                    EventType[val][0] + EventType[val].slice(1).toLowerCase(),
                key: Number(val),
            });
        }
        return options;
    }, []);

    const { data: allPeople } = useAllPersons();

    const createEventMutation = useCreateNewEvent();

    const [newPersonName, setNewPersonName] = useState<string>();
    const createPersonMutation = useCreatePerson();
    const [popoverOpenName, setPopoverOpenName] = useState<
        "primary" | "secondary" | undefined
    >();

    return (
        <Modal open={open} onCancel={onCancel} footer={null} maskClosable>
            <Typography.Title level={4}>Add Event</Typography.Title>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "5px",
                        alignItems: "center",
                    }}
                >
                    <Typography.Text
                        style={{ width: "150px", fontSize: "16px" }}
                    >
                        Type:{" "}
                    </Typography.Text>
                    <Select
                        style={{ width: "200px" }}
                        options={event_options}
                        value={newEvent?.event_type}
                        onChange={(val) => {
                            setNewEvent((e) => ({ ...e, event_type: val }));
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "5px",
                        alignItems: "center",
                    }}
                >
                    <Typography.Text
                        style={{ width: "150px", fontSize: "16px" }}
                    >
                        Who got the{" "}
                        {EventType[newEvent.event_type][0] +
                            EventType[newEvent.event_type]
                                .slice(1)
                                .toLowerCase()}
                        :
                    </Typography.Text>
                    <Select
                        showSearch
                        style={{ width: "200px" }}
                        options={(allPeople ?? [])
                            .filter(
                                (p) =>
                                    p.token !==
                                    newEvent?.secondary_person_token,
                            )
                            .map((p) => ({
                                label: p.name,
                                value: p.token,
                                key: p.token,
                            }))}
                        value={newEvent?.primary_person_token}
                        onChange={(val) => {
                            setNewEvent((e) => ({
                                ...e,
                                primary_person_token: val,
                            }));
                        }}
                    />
                    <Popover
                        trigger="click"
                        open={popoverOpenName === "primary"}
                        content={
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "3px",
                                    width: "100%",
                                }}
                            >
                                <Input
                                    placeholder="Name"
                                    value={newPersonName}
                                    onChange={(e) => {
                                        setNewPersonName(e.target.value);
                                    }}
                                    autoFocus
                                />
                                <Button
                                    disabled={
                                        !newPersonName ||
                                        (allPeople ?? [])
                                            .map((p) => p.name.toLowerCase())
                                            .includes(
                                                (newPersonName ?? "")
                                                    .trim()
                                                    .toLowerCase(),
                                            )
                                    }
                                    onClick={() => {
                                        if (!newPersonName) {
                                            return;
                                        }
                                        createPersonMutation.mutate(
                                            newPersonName,
                                            {
                                                onSuccess: (person) => {
                                                    setNewPersonName(undefined);
                                                    setNewEvent((e) => ({
                                                        ...e,
                                                        primary_person_token:
                                                            person.token,
                                                    }));
                                                    setPopoverOpenName(
                                                        undefined,
                                                    );
                                                },
                                            },
                                        );
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        }
                    >
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => {
                                if (popoverOpenName) {
                                    setPopoverOpenName(undefined);
                                } else {
                                    setPopoverOpenName("primary");
                                }
                            }}
                        />
                    </Popover>
                </div>
                {newEvent?.event_type !== EventType.OBSERVE ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "5px",
                            alignItems: "center",
                        }}
                    >
                        <Typography.Text
                            style={{ width: "150px", fontSize: "16px" }}
                        >
                            Who got the{" "}
                            {newEvent?.event_type === EventType.KILL
                                ? "Assist"
                                : "Kill"}
                            :
                        </Typography.Text>
                        <Select
                            style={{ width: "200px" }}
                            options={(allPeople ?? [])
                                .filter(
                                    (p) =>
                                        p.token !==
                                        newEvent?.primary_person_token,
                                )
                                .map((p) => ({
                                    label: p.name,
                                    value: p.token,
                                    key: p.token,
                                }))}
                            value={newEvent?.secondary_person_token}
                            onChange={(val) => {
                                setNewEvent((e) => ({
                                    ...e,
                                    secondary_person_token: val,
                                }));
                            }}
                        />
                        <Popover
                            trigger="click"
                            open={popoverOpenName === "secondary"}
                            content={
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "3px",
                                        width: "100%",
                                    }}
                                >
                                    <Input
                                        placeholder="Name"
                                        value={newPersonName}
                                        onChange={(e) => {
                                            setNewPersonName(e.target.value);
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        disabled={
                                            !newPersonName ||
                                            (allPeople ?? [])
                                                .map((p) =>
                                                    p.name.toLowerCase(),
                                                )
                                                .includes(
                                                    (newPersonName ?? "")
                                                        .trim()
                                                        .toLowerCase(),
                                                )
                                        }
                                        onClick={() => {
                                            if (!newPersonName) {
                                                return;
                                            }
                                            createPersonMutation.mutate(
                                                newPersonName,
                                                {
                                                    onSuccess: (person) => {
                                                        setNewPersonName(
                                                            undefined,
                                                        );
                                                        setNewEvent((e) => ({
                                                            ...e,
                                                            secondary_person_token:
                                                                person.token,
                                                        }));
                                                        setPopoverOpenName(
                                                            undefined,
                                                        );
                                                    },
                                                },
                                            );
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            }
                        >
                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    if (popoverOpenName) {
                                        setPopoverOpenName(undefined);
                                    } else {
                                        setPopoverOpenName("secondary");
                                    }
                                }}
                            />
                        </Popover>
                    </div>
                ) : null}
                <Button
                    type="primary"
                    size="large"
                    disabled={
                        !newEvent?.event_type || !newEvent?.primary_person_token
                    }
                    onClick={() => {
                        createEventMutation.mutate(newEvent, {
                            onSettled: onCancel,
                        });
                    }}
                >
                    Report
                </Button>
            </div>
        </Modal>
    );
};

const getScore = (row: LeaderboardRow) => {
    return row.kills + row.assists / 2;
};

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const { data: leaderboardData } = useLeaderboardData();
    const columns: ColumnsType<LeaderboardRow> = [
        {
            key: "name",
            title: "Name",
            render: (lRow) => lRow.person.name,
            sorter: (r1, r2) => r1.person.name.localeCompare(r2.person.name),
        },
        {
            key: "score",
            title: "Score",
            align: "right",
            render: (r) => getScore(r),
            sorter: (r1, r2) => (getScore(r1) < getScore(r2) ? -1 : 1),
            width: 50,
            defaultSortOrder: "descend",
        },
        {
            key: "kills",
            title: "Kills",
            render: (lRow) => lRow.kills,
            align: "right",
            sorter: (r1, r2) => (r1.kills < r2.kills ? -1 : 1),
            width: 50,
        },
        {
            key: "assists",
            title: "Assists",
            render: (lRow) => lRow.assists,
            align: "right",
            sorter: (r1, r2) => (r1.assists < r2.assists ? -1 : 1),
            width: 50,
        },
        {
            key: "observes",
            title: "Observations",
            render: (lRow) => lRow.observes,
            align: "right",
            sorter: (r1, r2) => (r1.observes < r2.observes ? -1 : 1),
            width: 50,
        },
    ];

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <AddEventModal
                open={addModalOpen}
                onCancel={() => {
                    setAddModalOpen(false);
                }}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography.Title level={4}>Leaderboard</Typography.Title>
                <Button
                    type="primary"
                    onClick={() => {
                        setAddModalOpen(true);
                    }}
                >
                    <PlusOutlined /> Event
                </Button>
            </div>
            <Table
                scroll={{ x: "max-content" }}
                columns={columns}
                dataSource={(leaderboardData ?? []).map((lRow) => ({
                    ...lRow,
                    key: lRow.person.token,
                }))}
                pagination={{
                    hideOnSinglePage: true,
                    pageSize: 20,
                    total: leaderboardData?.length ?? 0,
                }}
                style={{ height: "100%", width: "100%" }}
            />
        </div>
    );
};

export default Home;
