import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { useLogin } from "services/auth_service";

export interface LoginProps {}

const Login = ({}: LoginProps) => {
    const [name, setName] = useState<string>();
    const [password, setPassword] = useState<string>();
    const loginMutation = useLogin();
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "600px",
            }}
        >
            <div>Eradicate Lantern Flies Leaderboard</div>
            <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{
                    border: "1px solid gray",
                    borderRadius: "10px",
                    width: "350px",
                    height: "180px",
                    padding: "10px",
                    position: "relative",
                }}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Enter Name" }]}
                >
                    <Input
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Enter Password" }]}
                >
                    <Input.Password
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                </Form.Item>
                <Form.Item style={{ position: "absolute", right: "10px" }}>
                    <Button
                        type="primary"
                        disabled={!name || !password}
                        onClick={() => {
                            if (!name || !password) {
                                return;
                            }
                            loginMutation.mutate({ name, password });
                        }}
                    >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
