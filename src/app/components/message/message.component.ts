import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {IMessage} from '../../constants/message.interface';
import {ChatService} from '../../services/chat.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  imports: [
    DatePipe,
  ],
})
export class MessageComponent {
  @Input() message!: IMessage;
  chatService = inject(ChatService);
}
