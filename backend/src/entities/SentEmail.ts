import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "sent_emails" })
export class SentEmail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  toEmail!: string;

  @Column()
  subject!: string;

  @Column("text")
  body!: string;

  @Column()
  senderEmail!: string;

  @Column({ nullable: true })
  errorMessage!: string;

  @Column({ default: "sent" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
