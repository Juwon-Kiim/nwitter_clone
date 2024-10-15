import styled from 'styled-components';
import { ITweet } from './timeline';
import { auth, db, storage } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useState } from 'react';

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;
const Column = styled.div``;
const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
`;
const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;
const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;
const EditButton = styled.button`
    background-color: #00db00;
    margin-right: 5px;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;
const DeleteButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;
const OKButton = styled.button`
    background-color: #00db00;
    margin-right: 5px;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;
const CancelButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;
const Edit = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;
    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
    const [isEditing, setEditing] = useState(false);
    const [newTweet, setNewTweet] = useState(tweet);
    const user = auth.currentUser;
    const onEdit = () => {
        setEditing(true);
    }
    const onDelete = async () => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if (!ok ||user?.uid !== userId) return;
        try {
            await deleteDoc(doc(db, "tweets", id));
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            console.log(e);
        } finally {
            
        }
    }
    const onOK = async () => {
        if (user?.uid !== userId || tweet.length > 180) return;
        try {
            await updateDoc(doc(db, "tweets", id), {
                tweet: newTweet,
            });
        } catch (e) {
            console.log(e);
        } finally {
            setEditing(false);
        }
    };
    const onCancel = () => {
        setEditing(false);
    };
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewTweet(e.target.value);
    }
    return (
        <Wrapper>
            <Column>
                <Username>{username}</Username>
                {isEditing ? <Edit onChange={onChange}>{newTweet}</Edit> : <Payload>{tweet}</Payload>}
                {user?.uid === userId ? isEditing ? <OKButton onClick={onOK}>OK</OKButton> : <EditButton onClick={onEdit}>Edit</EditButton> : null}
                {user?.uid === userId ? isEditing ? <CancelButton onClick={onCancel}>Cancel</CancelButton> : <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
            </Column>
            <Column>
                {photo ? <Photo src={photo} /> : null}
            </Column>
        </Wrapper>
    )
}