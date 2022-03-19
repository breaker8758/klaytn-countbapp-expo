import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

import caver from '../klaytn/caver'

export default function BlockNumberScreen() {

    // BlockNumber component has a 'currentBlockNumber' state
    const [currentBlockNumber, setCurrentBlockNumber] = useState('...loading');

    // 'getBlockNumber' method works
    // 1) get current block number from klaytn node by calling 'caver.klay.getBlockNumber()'
    // 2) set 'currentBlockNumber' state to the value fetched from step 1)
    async function getBlockNumber() {
        const blockNumber = await caver.klay.getBlockNumber();
        setCurrentBlockNumber(blockNumber);
    }

    // 'react-navigation' 라이브러리 사용시 'unmount'가 호출되지 않는 이슈가 있음
    // 'useFocusEffect' 라이브러리를 사용해 우회 적용
    useFocusEffect(
        useCallback(() => {
            // Do something when the screen is focused
            // call 'getBlockNumber' method intervally
            const getBlockNumberInterval = setInterval(() => {
                getBlockNumber();
            }, 1000);

            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
                // clear interval
                clearInterval(getBlockNumberInterval);
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Block No. {currentBlockNumber}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
