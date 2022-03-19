import { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, AsyncStorage } from 'react-native';

import caver from '../klaytn/caver'

// Auth component manages authentication.
// It provides two different access method.
// 1) By keystore(json file) + password
// 2) By privatekey
export default function LoginScreen() {

    const [privateKey, setPrivateKey] = useState('');

    // reset method reset states to intial state
    function reset(str) {
        setPrivateKey(str);
    };

    // handleLogin method
    function handleLogin() {
        if (privateKey != '') {
            integrateWallet(privateKey);
        } else {
            wrongPivateKeyAlert();
        }
    };

    // getWallet method get wallet instance from caver
    function getWallet() {
        if (caver.klay.accounts.wallet.length) {
            return caver.klay.accounts.wallet[0];
        }
    }

    function wrongPivateKeyAlert() {
        Alert.alert(
            null,
            '잘못된 private key 입니다.',
            [
                { text: 'OK' }
            ]
        );
    }

    // integrateWallet method integrate wallet instance to caver
    // In detail, this method works like the step below
    // 1) it takes private key as an input argument
    // 2) get wallet instance through caver with private key
    // 3) set wallet instance to session storage for storing wallet instance
    // cf) session storage stores item until tab is closed
    function integrateWallet(privateKey) {
        try {
            const walletInstance = caver.klay.accounts.privateKeyToAccount(privateKey)
            caver.klay.accounts.wallet.add(walletInstance)
            AsyncStorage.setItem('walletInstance', JSON.stringify(walletInstance))
            reset('');
        } catch (error) {
            wrongPivateKeyAlert();
        }
    }

    // removeWallet method removes
    // 1) wallet instance from caver.klay.accounts
    // 2) 'walletInstance' value from session storage
    function removeWallet() {
        try {
            caver.klay.accounts.wallet.clear();
            AsyncStorage.removeItem('walletInstance');
            reset();
        } catch (error) {
            console.log(error);
        }
    }

    function RenderAuth() {
        const walletInstance = getWallet();
        // 'walletInstance' exists means that wallet is already integrated.
        if (walletInstance) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Integrated: {walletInstance.address}</Text>
                    <Button
                        title="Logout"
                        onPress={removeWallet}
                    />
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Private Key: </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPrivateKey}
                    value={privateKey}
                    maxLength={100}
                    multiline
                />
                <Button
                    title="Login"
                    onPress={handleLogin}
                />
            </View>
        )
    }

    return RenderAuth();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    title: {
        textAlign: 'center',
        marginVertical: 8,
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
    },
});
