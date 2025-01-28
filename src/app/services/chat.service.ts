import {Injectable} from '@angular/core';
import {StorageKeysEnum} from '../constants/storage-keys.enum';
import {IMessage} from '../constants/message.interface';
import {BehaviorSubject, fromEvent, map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  userId?: number;

  messages$ = new BehaviorSubject<IMessage[]>(this.messages);
  private readonly typingState$ = new BehaviorSubject<Array<number>>(this.typingState);

  get typingStateObservable(): Observable<string> {
    return this.typingState$.pipe(
      map(res => this.formatTypingMessage(res.filter(id => id !== this.userId)),
      ),
    );
  }

  setIsTyping(isTyping: boolean) {
    const newValue = this.typingState.filter((v) => v !== this.userId);
    if (isTyping && this.userId) {
      newValue.push(this.userId);
    }
    localStorage.setItem(StorageKeysEnum.TYPINGS, JSON.stringify(newValue));
  }

  get typingState(): number[] {
    return JSON.parse(localStorage.getItem(StorageKeysEnum.TYPINGS) ?? '[]');
  }

  private formatTypingMessage(ids: number[]): string {
    if (!ids.length) return '';
    if (ids.length === 1) return `${this.getTabName(ids[0])} печатает...`;
    if (ids.length <= 3) return `${ids.map(id => this.getTabName(id)).join(', ')} печатают...`;
    return `${ids.slice(0, 3).map(id => this.getTabName(id)).join(', ')} и еще ${ids.length - 3} печатают...`;
  }

  constructor() {
    this.initializeUser();
    this.initListeners();
  }

  private initListeners(): void {
    fromEvent<StorageEvent>(window, 'storage')
      .subscribe((event: StorageEvent) => {
        if (!event.key) {
          this.messages$.next([]);
          this.typingState$.next([]);
          this.userList = [this.userId];
          return;
        }
        if (event.key === StorageKeysEnum.MESSAGES) {
          this.messages$.next(JSON.parse(event.newValue ?? '[]'));
        }
        if (event.key === StorageKeysEnum.TYPINGS) {
          this.typingState$.next(JSON.parse(event.newValue ?? '[]'));
        }
      });
  }

  private set userList(value: any) {
    localStorage.setItem(StorageKeysEnum.USERS_LIST, JSON.stringify(value || '[]'));
  }

  private get userList(): number[] {
    return JSON.parse(localStorage.getItem(StorageKeysEnum.USERS_LIST) ?? '[]').sort();
  }


  private set messages(value: IMessage[]) {
    localStorage.setItem(StorageKeysEnum.MESSAGES, JSON.stringify(value || '[]'));
  }

  private get messages(): IMessage[] {
    return JSON.parse(localStorage.getItem(StorageKeysEnum.MESSAGES) ?? '[]');
  }

  removeUser() {
    const oldList = this.userList;
    this.userList = oldList.filter((value: any) => value !== this.userId);
  }

  private initializeUser() {
    let i = 1;
    while (this.userList?.length && !this.userId) {
      if (this.userList.includes(i)) {
        i++;
        continue;
      }
      this.userId = i;
    }
    this.userList = [...this.userList, this.userId ?? i];
  }


  sendMessage(text: string): void {
    if (!this.userId) return;
    this.messages = [...this.messages, {createdAt: new Date(), from: this.userId, text}];
    this.messages$.next(this.messages);
    this.setIsTyping(false);
  }

  getTabName(tabId: any) {
    return `Вкладка № ${tabId}`;
  }
}
