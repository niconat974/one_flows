import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="notes-container">
      <div class="notes-form">
        <h2>{{ editingNote ? 'Modifier la note' : 'Nouvelle note' }}</h2>
        <form [formGroup]="noteForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <input type="text" formControlName="title" placeholder="Titre">
          </div>
          <div class="form-group">
            <textarea formControlName="content" placeholder="Contenu"></textarea>
          </div>
          <button type="submit">{{ editingNote ? 'Mettre à jour' : 'Créer' }}</button>
          <button type="button" *ngIf="editingNote" (click)="cancelEdit()">Annuler</button>
        </form>
      </div>

      <div class="notes-list">
        <h2>Mes notes</h2>
        <div class="note-card" *ngFor="let note of notes">
          <h3>{{ note.title }}</h3>
          <p>{{ note.content }}</p>
          <div class="note-actions">
            <button (click)="editNote(note)">Modifier</button>
            <button (click)="deleteNote(note.id!)">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notes-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    .notes-form {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .note-card {
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .note-actions {
      display: flex;
      gap: 0.5rem;
    }
    textarea {
      width: 100%;
      min-height: 150px;
    }
  `]
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  noteForm: FormGroup;
  editingNote: Note | null = null;

  constructor(
    private noteService: NoteService,
    private formBuilder: FormBuilder
  ) {
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (notes) => this.notes = notes,
      error: (error) => console.error('Erreur lors du chargement des notes:', error)
    });
  }

  onSubmit() {
    if (this.noteForm.valid) {
      const noteData = this.noteForm.value;
      
      if (this.editingNote) {
        this.noteService.updateNote(this.editingNote.id!, noteData).subscribe({
          next: () => {
            this.loadNotes();
            this.resetForm();
          },
          error: (error) => console.error('Erreur lors de la mise à jour:', error)
        });
      } else {
        this.noteService.createNote(noteData).subscribe({
          next: () => {
            this.loadNotes();
            this.resetForm();
          },
          error: (error) => console.error('Erreur lors de la création:', error)
        });
      }
    }
  }

  editNote(note: Note) {
    this.editingNote = note;
    this.noteForm.patchValue({
      title: note.title,
      content: note.content
    });
  }

  deleteNote(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => this.loadNotes(),
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingNote = null;
    this.noteForm.reset();
  }
}