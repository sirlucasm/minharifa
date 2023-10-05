/* eslint-disable no-unused-vars */
import { auth, db } from "@/configs/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  DocumentData,
  updateDoc,
  and,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { removeStorage, setStorage } from "@/utils/storage";
import { CreateUserDto, LoginUserDto, UserType } from "@/@types/user.type";
import moment from "moment";
import { ERRORS, FIREBASE_ERRORS } from "@/constants";

const usersRef = collection(db, "users");

class AuthService {
  hasVerifiedAccountAuthentication = async (email: string) => {
    const q = query(
      usersRef,
      and(
        where("email", "==", email),
        where("lastVerificationAt", ">=", moment().subtract(30, "day").toDate())
      )
    );

    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  };

  getUser = async (emailOrUsername: string) => {
    const isEmail = emailOrUsername && emailOrUsername.includes("@");

    const q = query(
      usersRef,
      where(isEmail ? "email" : "phoneNumber", "==", emailOrUsername)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty)
      return {
        user: undefined,
        userDoc: undefined,
        userCount: 0,
      };

    const users: DocumentData[] = [];
    const userDocIds: string[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
      userDocIds.push(doc.id);
    });
    const user = users[0];

    return {
      user: user as UserType,
      userDoc: doc(db, "users", userDocIds[0]),
      userCount: users.length,
    };
  };

  getAuthenticatedUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return undefined;

    const { user } = await this.getUser(currentUser.email as string);
    if (!user) return undefined;
    return Object.assign(user, currentUser);
  };

  createUser = async ({ email, password, username }: CreateUserDto) => {
    const { user } = await this.getUser(email);

    if (user) throw ERRORS.accountAlreadyExists;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential) throw ERRORS.accountRegistrationFailed;

    const userDoc = doc(db, "users", userCredential.user.uid);

    await setDoc(userDoc, {
      id: userCredential.user.uid,
      email,
      username,
      verifiedUserEmail: false,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      isDeleted: false,
    });

    await sendEmailVerification(userCredential.user, {
      url:
        `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?e=${email}` || "",
    });

    setStorage("last_logged_email", email);
  };

  signInUser = async ({ email, password }: LoginUserDto) => {
    const { user, userDoc } = await this.getUser(email);

    if (!user) throw ERRORS.accountIncorrectCredentials;

    let loggedUser;
    try {
      loggedUser = await signInWithEmailAndPassword(auth, email, password);
      setStorage("last_logged_email", email);
    } catch (error: any) {
      if (FIREBASE_ERRORS.auth.includes(error?.code))
        throw ERRORS.accountIncorrectCredentials;
      throw ERRORS.accountSignInFailed;
    }

    if (!loggedUser) throw ERRORS.accountIncorrectCredentials;

    await updateDoc(userDoc, {
      lastLoginAt: new Date(),
    });
  };

  logoutUser = async () => {
    removeStorage("last_logged_email");
    await auth.signOut();
  };
}

const authService = new AuthService();
export default authService;
