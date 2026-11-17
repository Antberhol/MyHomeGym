package com.myhomegym.catalog;

import java.time.Duration;
import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myhomegym.common.NotFoundException;

@RestController
@RequestMapping("/api/catalog/exercises")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public ResponseEntity<List<CatalogExercise>> list(@RequestParam(defaultValue = "es") String lang) {
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofHours(1))).body(catalog.list(lang));
    }

    @GetMapping("/{id}")
    public CatalogExercise detail(@PathVariable String id, @RequestParam(defaultValue = "es") String lang) {
        return catalog.detail(id, lang).orElseThrow(() -> new NotFoundException("No existe el ejercicio " + id));
    }
}
