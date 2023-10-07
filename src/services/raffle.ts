import { CreateRaffleDto, IRaffle } from "@/@types/raffle.type";
import { db } from "@/configs/firebase";
import { ERRORS } from "@/constants";
import {
  DocumentData,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const rafflesRef = collection(db, "raffles");

class RaffleService {
  createRaffle = async (userId: string, data: CreateRaffleDto) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", data.shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.raffleShortNameExists;

    const raffleDoc = doc(rafflesRef);

    await setDoc(raffleDoc, {
      ...data,
      quantity: parseInt(data.quantity as string),
      id: raffleDoc.id,
      createdAt: new Date(),
      userId,
      isDeleted: false,
    });
  };

  listRaffle = async (userId: string) => {
    const q = query(
      rafflesRef,
      where("userId", "==", userId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const raffles: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      raffles.push(doc.data());
    });

    return raffles as IRaffle[];
  };

  getRaffle = async (shortName: string, userId: string) => {
    const q = query(
      rafflesRef,
      where("userId", "==", userId),
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const raffle = querySnapshot.docs[0].data();

    return raffle as IRaffle;
  };
}

const raffleService = new RaffleService();
export default raffleService;
