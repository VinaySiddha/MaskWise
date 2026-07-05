import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { useChat } from '../../hooks/useChat';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat('demo-doc-id');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.title}>AI Assistant</Text>
      
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
      />
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Ask a question about the documents..." 
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 32, color: 'white', fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },
  messageList: { padding: 20, paddingBottom: 10 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { color: 'white', fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background, color: 'white', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginRight: 10 },
  sendButton: { backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 20 },
  sendText: { color: 'white', fontWeight: 'bold' }
});
