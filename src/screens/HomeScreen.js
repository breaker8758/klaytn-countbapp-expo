import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Button, Linking, Alert, AsyncStorage } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

import Constants from 'expo-constants';
import caver from '../klaytn/caver'

import BlockNumberScreen from './BlockNumberScreen';

export default function HomeScreen() {

    // ** 1. Create contract instance **
    // ex:) new caver.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS)
    // You can call contract method through this instance.`
    // Now you can access the instance by `this.countContract` variable.
    const DEPLOYED_ADDRESS = Constants.manifest.extra.DEPLOYED_ADDRESS;
    const DEPLOYED_ABI = JSON.parse(Constants.manifest.extra.DEPLOYED_ABI);
    const [countContract, setCountContract] = useState(DEPLOYED_ABI && DEPLOYED_ADDRESS && new caver.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS));

    const [count, setCount] = useState('');
    const [lastParticipant, setLastParticipant] = useState('');
    const [isSetting, setIsSetting] = useState(false);
    const [settingDirection, setSettingDirection] = useState('');
    const [txHash, setTxHash] = useState();
    const [isSpinner, setIsSpinner] = useState(false);

    // sessionStorage is internet browser's feature which stores data
    // until the browser tab is closed.
    const [walletFromSession, setWalletFromSession] = useState(AsyncStorage.getItem('walletInstance'));

    // If 'walletInstance' value exists, add it to caver's wallet
    if (walletFromSession) {
        try {
            caver.klay.accounts.wallet.add(JSON.parse(walletFromSession))
        } catch (e) {
            // If value in sessionStorage is invalid wallet instance,
            // remove it from sessionStorage.
            AsyncStorage.removeItem('walletInstance')
        }
    }

    async function getCount() {
        // ** 2. Call contract method (CALL) **
        // ex:) this.countContract.methods.methodName(arguments).call()
        // You can call contract method (CALL) like above.
        // For example, your contract has a method called `count`.
        // You can call it like below:
        // ex:) this.countContract.methods.count().call()
        // It returns promise, so you can access it by .then() or, use async-await.
        const count = await countContract.methods.count().call();
        const lastParticipant = await countContract.methods.lastParticipant().call();
        setCount(count);
        setLastParticipant(lastParticipant);
    }

    function needToWalletAlert() {
        Alert.alert(
            null,
            '로그인이 필요합니다.',
            [
                { text: 'OK' }
            ]
        );
    }

    function setPlus() {
        const walletInstance = caver.klay.accounts.wallet && caver.klay.accounts.wallet[0];

        // Need to integrate wallet for calling contract method.
        if (!walletInstance) {
            needToWalletAlert();
            return;
        }

        setSettingDirection('plus');

        // 3. ** Call contract method (SEND) **
        // ex:) this.countContract.methods.methodName(arguments).send(txObject)
        // You can call contract method (SEND) like above.
        // For example, your contract has a method called `plus`.
        // You can call it like below:
        // ex:) this.countContract.methods.plus().send({
        //   from: '0x952A8dD075fdc0876d48fC26a389b53331C34585', // PUT YOUR ADDRESS
        //   gas: '200000',
        // })
        setIsSpinner(true);
        countContract.methods.plus().send({
            from: walletInstance.address,
            gas: '200000',
        })
            .then((result) => {
                setIsSpinner(false);
                setSettingDirection(null);
                setTxHash(result.transactionHash);
            })
            .catch((err) => {
                console.log(err);
                setIsSpinner(false);
                setSettingDirection(null);
            });
    }

    function setMinus() {
        const walletInstance = caver.klay.accounts.wallet && caver.klay.accounts.wallet[0];

        // Need to integrate wallet for calling contract method.
        if (!walletInstance) {
            needToWalletAlert();
            return;
        }

        setSettingDirection('minus');

        // 3. ** Call contract method (SEND) **
        // ex:) this.countContract.methods.methodName(arguments).send(txObject)
        // You can call contract method (SEND) like above.
        // For example, your contract has a method called `minus`.
        // You can call it like below:
        // ex:) this.countContract.methods.minus().send({
        //   from: '0x952A8dD075fdc0876d48fC26a389b53331C34585', // PUT YOUR ADDRESS
        //   gas: '200000',
        // })

        // It returns event emitter, so after sending, you can listen on event.
        // Use .on('transactionHash') event,
        // : if you want to handle logic after sending transaction.
        // Use .once('receipt') event,
        // : if you want to handle logic after your transaction is put into block.
        // ex:) .once('receipt', (data) => {
        //   console.log(data)
        // })
        setIsSpinner(true);
        countContract.methods.minus().send({
            from: walletInstance.address,
            gas: '200000',
        })
            .then((result) => {
                setIsSpinner(false);
                setSettingDirection(null);
                setTxHash(result.transactionHash);
            })
            .catch((err) => {
                console.log(err);
                setIsSpinner(false);
                setSettingDirection(null);
            });
    }

    // 'react-navigation' 라이브러리 사용시 'unmount'가 호출되지 않는 이슈가 있음
    // 'useFocusEffect' 라이브러리를 사용해 우회 적용
    useFocusEffect(
        useCallback(() => {
            // Do something when the screen is focused
            // call 'getCount' method intervally
            const getCountInterval = setInterval(() => {
                getCount();
            }, 1000);

            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
                // clear interval
                clearInterval(getCountInterval);
            };
        }, [])
    );

    return (
        <>
            <View style={styles.container}>
                <BlockNumberScreen />

                {Number(lastParticipant) !== 0 && (
                    <Text style={styles.title}>last participant: {lastParticipant}</Text>
                )}

                <Text style={styles.title}>COUNT: {count}</Text>

                <View style={styles.fixToText}>
                    <View style={{ width: 100 }}>
                        <Button
                            title="+"
                            onPress={setPlus}
                        />
                    </View>
                    <View style={{ width: 100 }}>
                        <Button
                            title="-"
                            onPress={setMinus}
                        />
                    </View>
                </View>

                {txHash && (
                    <>
                        <Text>You can check your last transaction in klaytnscope:
                            <Text style={{ color: 'blue' }}
                                onPress={() => Linking.openURL(`https://baobab.scope.klaytn.com/tx/${txHash}`)}>
                                {txHash}
                            </Text>
                        </Text>
                    </>
                )}

                <Spinner
                    visible={isSpinner}
                />

                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 50,
        height: 1,
    },
    fixToText: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
});
