package com.myhomegym.domain;

import java.util.List;

import com.myhomegym.common.OwnedRepository;

public interface ExerciseNoteRepository extends OwnedRepository<ExerciseNote> {

    List<ExerciseNote> findAllByOwnerIdAndEjercicioId(Long ownerId, String ejercicioId);
}
