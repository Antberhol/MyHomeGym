package com.myhomegym.domain;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myhomegym.common.OwnedCrudController;

import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/body-measurements")
public class BodyMeasurementController extends OwnedCrudController<BodyMeasurement> {

    public BodyMeasurementController(BodyMeasurementRepository repository, ObjectMapper mapper, Validator validator) {
        super(repository, mapper, validator);
    }
}
