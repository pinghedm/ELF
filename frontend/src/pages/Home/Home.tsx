import React, { useState } from "react";
import { Modal } from "antd";

const AddEventModal = ({
    open,
    onCancel,
}: {
    open: boolean;
    onCancel: () => void;
}) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            maskClosable
        ></Modal>
    );
};

export interface HomeProps {}

const Home = ({}: HomeProps) => {
    const [addModalOpen, setAddModalOpen] = useState(true);

    return (
        <div>
            <AddEventModal
                open={addModalOpen}
                onCancel={() => {
                    setAddModalOpen(false);
                }}
            />
        </div>
    );
};

export default Home;
