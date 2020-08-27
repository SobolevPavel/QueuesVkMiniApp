import React, {useState} from 'react';
import {Button, PanelHeader, Panel,  FormLayout, Input, File, Text} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';

let now = new Date().toLocaleDateString();
let nowTime = now.split('.').reverse().join('-')

const CreateQueue = ({ snackbar, id, go, setActiveModal, fetchedUser, setQueueCODE}) => {
    const [nameQueue, setNameQueue] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [avatarName, setAvatarName] = useState("");
    const [place, setPlace] = useState("");
    const [queueNameStatus, setQueueNameStatus] = useState('')
    const [queueDateStatus, setQueueDateStatus] = useState('')

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    const createQueueOnServer = () => {
        console.log('Отправлен запрос на создание очереди...');
        console.log('С параметрами:');
        console.log('id : ' + fetchedUser.id);
        console.log('Название очереди: ' + nameQueue);
        console.log('Mesto: ' + place);
        console.log('Дата проведения: ' + date.toString());
        console.log('Время проведения: ' + time);
        console.log('Описание очереди: ' + description);

        fetch('/createQueue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "userID": fetchedUser.id,
                "queueName": nameQueue,
                "queuePlace": place,
                "queueTime": time,
                "queueDate": date,
                "queueAvatarURL": global.queue.picURL,
                "queueDescription": description,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(function (data) {
                setQueueCODE(data);
                setActiveModal(MODAL_CARD_CHAT_INVITE);
            })
    };

    const onPhotoUpload = (e) => {
        global.queue.pic = e.target.files[0];
        global.queue.picName = nameQueue.replace(/\s+/g,'-') + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        setAvatarName(e.target.files[0].name);
        console.log(global.queue.picURL);
        console.log(global.queue.picName);
        console.log(global.queue.pic);
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }

    return(
        <Panel id={id} >
            <PanelHeader> Создание </PanelHeader>
            <FormLayout>
                <Input top={'Название очереди*'}
                       value={nameQueue}
                       maxlength = "32"
                       status={queueNameStatus}
                       bottom={queueNameStatus !== 'error' ? '' : 'Пожалуйста, введите название!'}
                       onChange={e => {
                           e.target.value.trim() ? setQueueNameStatus('valid') : setQueueNameStatus('error');
                           setNameQueue(e.target.value);
                       }}/>
                <Input top={'Место проведения'} maxlength = "40" value={place} onChange={e =>setPlace(e.target.value)}/>
                <Input top={'Дата проведения*'} min={nowTime} name={'date'} type={'date'}
                       value={date}
                       status={queueDateStatus}
                       bottom={queueDateStatus !== 'error' ? '' : 'Пожалуйста, выберите дату!'}
                       onChange={e =>{
                           let today = new Date(nowTime);
                           let pickedDate = new Date(e.target.value);
                           let curr_date = (today.getMonth() + 1) + '/' + today.getDate() + '/' +  today.getFullYear()
                           let pick_date = (pickedDate.getMonth() + 1) + '/' + pickedDate.getDate() + '/' +  pickedDate.getFullYear()
                           if(pick_date < curr_date){
                                setQueueDateStatus('error');
                           }else {
                               e.target.value.trim() ? setQueueDateStatus('valid') : setQueueDateStatus('error')
                           }
                           setDate(e.target.value)
                        }}/>
                <Input top={'Время начала'} name={'time'} type={'time'} value={time} onChange={e => setTime(e.target.value)}/>
                <File top="Аватарка очереди" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{avatarName}</Text>
                <Input top={'Краткое описание очереди'} maxlength = "40" value={description} onChange={e => setDescription(e.target.value)}/>
                <Button size="xl" onClick={() => {
                    if(nameQueue.trim() !== '' && date.trim() !== '') {
                        createQueueOnServer();

                        if(global.queue.pic !== undefined) {
                            fetch('https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o?uploadType=media&name=' + global.queue.picName, {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'image/png',
                                },
                                body: global.queue.pic
                            }).then(function (response) {
                                return response.json();
                            })
                                .then(function (data) {
                                    console.log('Картинка успешно загружена!!!');
                                })
                        }
                    }else{
                        setQueueNameStatus('error');
                        setQueueDateStatus('error');
                    }
                }}>Создать</Button>
            </FormLayout>
            {snackbar}
        </Panel>
    );
}

export default CreateQueue;