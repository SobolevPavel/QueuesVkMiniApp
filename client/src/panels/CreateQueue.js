import React, {useState} from 'react';
import {
    Button,
    PanelHeader,
    Panel,
    FormLayout,
    Input,
    File,
    Text,
    FormStatus,
    ScreenSpinner,
    Avatar, Snackbar, Div
} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
import Icon16Clear from '@vkontakte/icons/dist/16/clear';

const MODAL_CARD_CHAT_INVITE = 'chat-invite';



let now = new Date().toLocaleDateString();
let nowTime = now.split('.').reverse().join('-');

let nowIOSTime = now.split('/').reverse().join('-');
let IOSdateError = true;
let today;
let pickedDate;

const CreateQueue = ({ snackbar, id, go, setActiveModal, fetchedUser, setQueueCODE, setPopout, setSnackbar}) => {
    const [nameQueue, setNameQueue] = useState(global.queue.createName);
    const [date, setDate] = useState(global.queue.createDate);
    const [time, setTime] = useState(global.queue.createTime);
    const [description, setDescription] = useState(global.queue.createDescription);
    const [avatarName, setAvatarName] = useState("");
    const [place, setPlace] = useState(global.queue.createPlace);
    const [queueNameStatus, setQueueNameStatus] = useState('');
    const [queueDateStatus, setQueueDateStatus] = useState('');
    const [formStatusHeader, setFormStatusHeader] = useState('');
    const [formStatusDescription, setFormStatusDescription] = useState('');
    const [formStatusVisibility, setFormStatusVisibility] = useState(false);

    const createQueueOnServer = () => {
        setPopout(<ScreenSpinner/>);
        console.log('Отправлен запрос на создание очереди...');

        try {

            fetch('/createQueue', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "queueName": nameQueue,
                    "queuePlace": place,
                    "queueTime": time,
                    "queueDate": date,
                    "queueAvatarURL": global.queue.picURL,
                    "queueDescription": description,
                    "url": window.location.search.replace('?', '')
                })
            }).then(function (response) {
                return response.json();
            })
                .then(function (data) {
                    if(data === 'LIMIT REACHED'){
                        setSnackbar(<Snackbar
                            layout="vertical"
                            onClose={() => setSnackbar(null)}
                            before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                        >
                            Лимит в создании 5 очередей в день исчерпан!
                        </Snackbar>)
                        setPopout(null);

                    }else {
                        setQueueCODE(data);
                        setPopout(null);
                        let imgERR = false;
                        let img = document.createElement('img')
                        img.src = global.queue.picURL;
                        img.onload = () => console.log();
                        img.onerror = () => imgERR = true;

                        if(global.queue.picURL !== undefined && !imgERR) {
                            try {
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
                                        console.log('Картинка успешно загружена!');
                                    })
                            }catch(e){
                                setPopout(null);
                                setSnackbar(<Snackbar
                                    layout="vertical"
                                    onClose={() => setSnackbar(null)}
                                    before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                                >
                                    Ошибка соединения! Проверьте интернет!
                                </Snackbar>);
                            }
                        }
                        global.queue.picURL = undefined;
                        global.queue.pic = undefined;
                        setActiveModal(MODAL_CARD_CHAT_INVITE);
                    }
                }).catch((e) => {
                setPopout(null);
                setSnackbar(<Snackbar
                    layout="vertical"
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                >
                    Ошибка соединения! Проверьте интернет!
                </Snackbar>);
            })
        }catch (e){
            console.log('Ошибка при создании очереди...');
        }
    };

    const onPhotoUpload = (e) => {
        global.queue.pic = e.target.files[0];
        global.queue.picName = nameQueue.replace(/\s+/g,'-').replace('?', '')
            .replace('!', '').replace('!', '')
            + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        setAvatarName(e.target.files[0].name);
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }

    return(
        <Panel id={id} >
            <PanelHeader> Создание </PanelHeader>
            <FormLayout noValidate={true}>
                {formStatusVisibility &&
                <FormStatus header={formStatusHeader} mode="error">
                    {formStatusDescription}
                </FormStatus>
                }

                <Input top={'Название очереди*'}
                       value={nameQueue}
                       maxlength = "32"
                       status={queueNameStatus}
                       onChange={e => {
                           if(e.target.value.trim() === ''){
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите название очереди!')
                           }else{
                               setFormStatusVisibility(false);
                               setFormStatusDescription('');
                               setFormStatusHeader('');
                           }
                           global.queue.createName = e.target.value.trim();
                           e.target.value.trim() ? setQueueNameStatus('valid') : setQueueNameStatus('error');
                           setNameQueue(e.target.value);
                       }}/>
                <Input top={'Место проведения'} maxlength = "40" value={place} onChange={e =>{
                    setPlace(e.target.value);
                    global.queue.createPlace = e.target.value;
                }}/>
                <Input id = {'dateID'}
                       min={nowTime}
                       top={'Дата проведения*'}
                       novalidate
                       name={'date'} type={'date'}
                       value={date}
                       status={queueDateStatus}
                       onChange={e =>{
                           today = new Date(nowIOSTime);
                           pickedDate = new Date(e.target.value);
                           let dataCheck = document.getElementById('dateID');

                           if(dataCheck.validity.rangeUnderflow){
                               setQueueDateStatus('error');
                               setFormStatusVisibility(true);
                               global.queue.dataCheck = false;
                               if(formStatusHeader === 'Введите название очереди!') {
                                   setFormStatusHeader('Неверная дата и название!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }else{
                                   setFormStatusHeader('Неверная дата!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }
                           }else{
                               setFormStatusVisibility(false);
                               setQueueDateStatus('valid');
                               global.queue.dataCheck = true;
                           }
                           if(queueDateStatus === 'error'){
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Неверная дата!');
                               setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               global.queue.dataCheck = false;
                           }else{
                               global.queue.dataCheck = true;
                               setFormStatusVisibility(false);
                           }

                           if(today.getTime() > pickedDate.getTime()){
                               IOSdateError = false;
                               global.queue.dataCheck = false;
                               setQueueDateStatus('error');
                               setFormStatusVisibility(true);
                               if(formStatusHeader === 'Введите название очереди!') {
                                   setFormStatusHeader('Неверная дата и название!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }else{
                                   setFormStatusHeader('Неверная дата!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }
                           }else {
                               global.queue.dataCheck = true;
                               IOSdateError = true;
                               setFormStatusVisibility(false);
                           }
                           setDate(e.target.value)
                           global.queue.createDate = e.target.value;
                        }}/>
                <Input top={'Время начала'} name={'time'} type={'time'} value={time} onChange={e =>{
                    setTime(e.target.value);
                    global.queue.createTime = e.target.value;
                }}/>
                <File top="Аватарка очереди" accept="image/*" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{avatarName}</Text>
                <Input top={'Краткое описание очереди'} maxlength = "40" value={description} onChange={e => {
                    setDescription(e.target.value)
                    global.queue.createDescription = e.target.value;
                }}/>
                <Button size="xl" onClick={() => {

                    let dataCheck = document.getElementById('dateID');


                    if(!global.queue.dataCheck){
                        setQueueDateStatus('error');
                        setFormStatusVisibility(true);
                        if(formStatusHeader === 'Введите название очереди!') {
                            setFormStatusHeader('Неверная дата и название!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                        }else{
                            setFormStatusHeader('Неверная дата!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                        }
                    }

                    if(!IOSdateError){
                        setQueueDateStatus('error');
                        setFormStatusVisibility(true);
                        if(formStatusHeader === 'Введите название очереди!') {
                            setFormStatusHeader('Неверная дата и название!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                        }else{
                            setFormStatusHeader('Неверная дата!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                        }
                    }

                    if(nameQueue.trim() !== '' && date.trim() !== '' && IOSdateError && global.queue.dataCheck && !dataCheck.validity.rangeUnderflow) {
                        setFormStatusVisibility(false);
                        createQueueOnServer();
                        global.queue.createPlace = '';
                        global.queue.createDescription = '';
                        global.queue.createTime = '';
                        global.queue.createDate = '';
                        global.queue.createName = '';


                    }else{
                        if(date.trim() === '' && nameQueue.trim() === ''){
                            setQueueNameStatus('error');
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название и дату!')

                        }else if((!IOSdateError || !global.queue.dataCheck) && nameQueue.trim() === ''){
                            setQueueNameStatus('error');
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название и корректную дату!')

                        }else if(nameQueue.trim() === '') {
                            setQueueNameStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название!')

                        }else if(date.trim() === '') {
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите дату!')
                        }
                    }
                }}>Создать</Button>
            </FormLayout>
            {snackbar}
        </Panel>
    );
}

export default CreateQueue;