import {Component, DestroyRef, ElementRef, HostListener, inject, OnInit, Signal, viewChild} from '@angular/core';
import {ChatService} from './services/chat.service';
import {MatToolbar} from '@angular/material/toolbar';
import {AsyncPipe} from '@angular/common';
import {MatFormField} from '@angular/material/form-field';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, defer, tap, throttleTime} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MessageComponent} from './components/message/message.component';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [MatToolbar, AsyncPipe, MatFormField, MatInput, MatButton, ReactiveFormsModule, MessageComponent, MatSidenavContent, MatSidenav, MatSidenavContainer, MatIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  chatAreaRef: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild('chatArea', {read: ElementRef});
  readonly newMessage = new FormControl('');
  public readonly chatService = inject(ChatService);
  messages$ = defer(() => {
    console.warn('defer');
    return this.chatService.messages$
      .pipe(
        tap(() => {
          if (!this.chatAreaRef()?.nativeElement.scrollTop) {
            this.scrollToTheEnd();
          }
        }),
      );
  });

  constructor(private readonly destroy: DestroyRef) {
  }

  ngOnInit(): void {
    this.newMessage.valueChanges
      .pipe(
        throttleTime(250),
        tap(() => {
          this.chatService.setIsTyping(true);
        }),
        debounceTime(3000),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe(() => this.chatService.setIsTyping(false));

  }

  sendMessage() {
    if (!this.newMessage.value) return;
    this.chatService.sendMessage(this.newMessage.value);
    this.newMessage.reset();
    this.scrollToTheEnd();
  }

  private scrollToTheEnd() {
    const chatEl = this.chatAreaRef()?.nativeElement;
    if (!chatEl) return;

    requestAnimationFrame(() => chatEl.scrollTo({
      top: chatEl.scrollHeight, behavior: 'smooth',
    }));
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload() {
    this.chatService.removeUser();
  }

  protected readonly visualViewport = visualViewport;
}
