// src/entities/ScheduledEmail.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class ScheduledEmail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  to!: string;

  @Column()
  subject!: string;

  @Column()
  body!: string;

  @Column()
  senderEmail!: string;

  @Column({ default: "scheduled" })
  status!: string; // scheduled | queued | sent | failed

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  startTime?: Date;

  @Column({ default: 0 })
  delay!: number;

  @Column({ default: 0 })
  hourlyLimit!: number;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;
}
