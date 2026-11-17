package com.myhomegym.domain;

import java.util.List;

import com.myhomegym.common.OwnedRepository;

public interface RoutineExerciseRepository extends OwnedRepository<RoutineExercise> {

    List<RoutineExercise> findAllByOwnerIdAndRutinaId(Long ownerId, String rutinaId);

    List<RoutineExercise> findAllByOwnerIdAndEjercicioId(Long ownerId, String ejercicioId);
}
