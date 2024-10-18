import styled from 'styled-components'
import { auth, db, storage } from '../firebase';
import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ITweet } from '../components/timeline';
import Tweet from '../components/tweet';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;
const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        width: 50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;
`;
const AvatarInput = styled.input`
    display: none;
`;
const Edit = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;
const Name = styled.span`
    display: flex;
    font-size: 22px;
`;
const EditBtn = styled.label`
    margin-left: 5px;
    width: 15px;
    height: 15px;
    cursor: pointer;
`;
const NameEdit = styled.textarea`
    padding-top: 25px;
    font-size: 22px;
    color: white;
    border-radius: 10px;
    background-color: black;
    text-align: center;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;
`;
const OKButton = styled.button`
    background-color: #00db00;
    margin-left: 5px;
    color: white;
    font-weight: 600;
    width: 50px;
    height: 30px;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    
    cursor: pointer;
`;
const CancelButton = styled.button`
    background-color: tomato;
    margin-left: 5px;
    color: white;
    font-weight: 600;
    width: 70px;
    height: 30px;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;
const Tweets = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isEditing, setEditing] = useState(false);
    const [name, setName] = useState(user?.displayName);
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl,
            });
        }
    };
    const onEdit = () => {
        setEditing(true);
    }
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        setName(e.target.value);
    }
    const onOK = async () => {
        if (!user) return;
        await updateProfile(user, {
            displayName: name,
        });
        setEditing(false);
    }
    const onCancel = () => {
        setName(user?.displayName);
        setEditing(false);
    }
    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map(doc => {
            const { tweet, createdAt, userId, username, photo } = doc.data();
            return {
                tweet, createdAt, userId, username, photo,
                id: doc.id,
            };
        })
        setTweets(tweets);
    }
    useEffect(() => { fetchTweets() }, []);
    return <Wrapper>
        <AvatarUpload htmlFor="avatar">
            {avatar ? <AvatarImg src={avatar} /> : (<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
</svg>)}
        </AvatarUpload>
        <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
        {isEditing ? <Edit><NameEdit onChange={onChange}>{name}</NameEdit><OKButton onClick={onOK}>OK</OKButton><CancelButton onClick={onCancel}>Cancel</CancelButton></Edit> : <><Name>{user?.displayName ?? "Anonymous"}<EditBtn onClick={onEdit}><svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
        </svg></EditBtn></Name></>}
        <Tweets>{tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}</Tweets>
    </Wrapper>
}