import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FarmerUser, LedgerEntry } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export function sanitizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  // return last 10 digits if longer
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function generateCustomerIds(mobile: string) {
  const clean = sanitizeMobile(mobile);
  return {
    docId: `kisan_${clean}`,
    uniqueDisplayId: `KISAN-${clean}`,
    cleanMobile: clean,
  };
}

/**
 * Save or update customer profile in Firestore cloud database
 */
export async function saveCustomerProfileToCloud(farmer: FarmerUser): Promise<void> {
  const path = `customers/${farmer.id}`;
  try {
    const dataToSave = {
      id: farmer.id,
      uniqueId: farmer.uniqueId,
      name: farmer.name,
      mobile: farmer.mobile,
      village: farmer.village,
      tehsil: farmer.tehsil || 'मंदसौर',
      district: farmer.district || 'मंदसौर',
      state: farmer.state || 'मध्य प्रदेश',
      cropsGrown: farmer.cropsGrown || [],
      totalLandBigha: farmer.totalLandBigha || 0,
      loggedInAt: farmer.loggedInAt || Date.now(),
      registeredAt: farmer.registeredAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'customers', farmer.id), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get customer profile from Firestore
 */
export async function getCustomerProfileFromCloud(customerId: string): Promise<FarmerUser | null> {
  const path = `customers/${customerId}`;
  try {
    const docSnap = await getDoc(doc(db, 'customers', customerId));
    if (!docSnap.exists()) return null;
    return docSnap.data() as FarmerUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Real-time subscription to customer ledger entries
 */
export function subscribeToCustomerEntries(
  customerId: string,
  onUpdate: (entries: LedgerEntry[]) => void,
  onError?: (error: unknown) => void
) {
  const path = `customers/${customerId}/entries`;
  const entriesCol = collection(db, 'customers', customerId, 'entries');

  return onSnapshot(
    entriesCol,
    (snapshot) => {
      const list: LedgerEntry[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as LedgerEntry);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
      onUpdate(list);
    },
    (error) => {
      console.warn('Realtime entries subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save or update single ledger entry in customer's subcollection
 */
export async function saveCustomerEntryToCloud(
  customerId: string,
  entry: LedgerEntry
): Promise<void> {
  const path = `customers/${customerId}/entries/${entry.id}`;
  try {
    const cleanEntry: LedgerEntry = {
      ...entry,
      customerId,
      customerMobile: entry.customerMobile || customerId.replace('kisan_', ''),
    };
    await setDoc(doc(db, 'customers', customerId, 'entries', entry.id), cleanEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete ledger entry from customer subcollection
 */
export async function deleteCustomerEntryFromCloud(
  customerId: string,
  entryId: string
): Promise<void> {
  const path = `customers/${customerId}/entries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'customers', customerId, 'entries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time subscription to all registered customers (For Admin / Lokendra Singh Panwar)
 */
export function subscribeToAllCustomers(
  onUpdate: (customers: FarmerUser[]) => void,
  onError?: (error: unknown) => void
) {
  const path = 'customers';
  const customersCol = collection(db, 'customers');

  return onSnapshot(
    customersCol,
    (snapshot) => {
      const list: FarmerUser[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as FarmerUser;
        if (data.id && data.mobile) {
          list.push(data);
        }
      });
      // sort latest registered first
      list.sort((a, b) => (b.loggedInAt || 0) - (a.loggedInAt || 0));
      onUpdate(list);
    },
    (error) => {
      console.warn('All customers real-time subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Fetch all entries of a customer once (For Admin inspection)
 */
export async function fetchCustomerEntriesOnce(customerId: string): Promise<LedgerEntry[]> {
  const path = `customers/${customerId}/entries`;
  try {
    const snap = await getDocs(collection(db, 'customers', customerId, 'entries'));
    const list: LedgerEntry[] = [];
    snap.forEach((d) => {
      list.push(d.data() as LedgerEntry);
    });
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
