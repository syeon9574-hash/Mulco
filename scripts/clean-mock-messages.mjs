// Firestore mock 메시지 일괄 삭제 스크립트
// Usage: node scripts/clean-mock-messages.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5cpyFXkiT2JZg4r8rj6sPzgfDs97cC4c",
  authDomain: "mulco-6ffa0.firebaseapp.com",
  projectId: "mulco-6ffa0",
  storageBucket: "mulco-6ffa0.firebasestorage.app",
  messagingSenderId: "683668241185",
  appId: "1:683668241185:web:554dcb23b6c15c4dfddc60",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock user IDs to delete (데모용 가짜 유저들)
const MOCK_USER_IDS = ['u001', 'u002', 'u003', 'u004', 'u005'];

async function cleanMockMessages() {
  console.log('🔍 chatMessages 컬렉션에서 더미 메시지 검색 중...');
  
  try {
    const snapshot = await getDocs(collection(db, 'chatMessages'));
    
    if (snapshot.empty) {
      console.log('✅ chatMessages 컬렉션이 이미 비어있습니다.');
      process.exit(0);
    }

    console.log(`📋 총 ${snapshot.size}개의 메시지 발견.`);

    let deleteCount = 0;
    const deletePromises = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = data.user_id || '';
      
      // mock user ID 이거나 test_ 로 시작하는 봇 메시지 삭제
      const isMockUser = MOCK_USER_IDS.some(id => userId.startsWith(id));
      const isTestUser = userId.startsWith('test_');
      
      if (isMockUser || isTestUser) {
        deletePromises.push(
          deleteDoc(doc(db, 'chatMessages', docSnap.id)).then(() => {
            console.log(`🗑️  삭제: [${userId}] ${data.content?.slice(0, 30)}...`);
          })
        );
        deleteCount++;
      }
    });

    if (deletePromises.length === 0) {
      console.log('✅ 삭제할 더미 메시지가 없습니다.');
    } else {
      await Promise.all(deletePromises);
      console.log(`\n✅ 완료: 총 ${deleteCount}개의 더미 메시지가 삭제되었습니다.`);
    }
    
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

cleanMockMessages();
