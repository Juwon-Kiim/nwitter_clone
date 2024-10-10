import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Error, Form, Input, Switcher, Title, Wrapper } from '../components/auth-components';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { FirebaseError } from 'firebase/app';

export default function FindPassword() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || email === "") return;
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            console.log(email);
            navigate("/login");
        } catch (e) {
            if (e instanceof FirebaseError) {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <Wrapper>
            <Title>Find Password</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="email" value={email} placeholder='Email' type="email" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Send Email"} />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account? <Link to="/login">Log in &rarr;</Link>
            </Switcher>
        </Wrapper>
    )
}