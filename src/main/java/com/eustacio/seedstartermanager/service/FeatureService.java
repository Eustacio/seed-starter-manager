package com.eustacio.seedstartermanager.service;

import com.eustacio.seedstartermanager.domain.Feature;
import com.eustacio.seedstartermanager.exception.DuplicateNameException;
import com.eustacio.seedstartermanager.exception.EntityNotFoundException;
import com.eustacio.seedstartermanager.repository.FeatureRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

/**
 * @author Wallison Freitas
 */
@Service
public class FeatureService extends NamedEntityService<Feature> {

    @Autowired
    public FeatureService(FeatureRepository repository) {
        super(repository);
    }

    @Override
    public Feature save(Feature feature) {
        Feature savedFeature;

        try {
            savedFeature = super.repository.save(feature);
        } catch (DataIntegrityViolationException dataIntegrityViolationException) {
            throw new DuplicateNameException("Cannot save the Feature '" + feature.getName() +
                    "', because it already exists", dataIntegrityViolationException);
        }

        return savedFeature;
    }

    @Override
    public boolean delete(Long id) {
        try {
            super.repository.deleteById(id);
        } catch (EmptyResultDataAccessException exception) {
            throw new EntityNotFoundException(String.format(
                    "Cannot delete the Feature with id %d because it does not exists", id), exception);
        }

        return !super.repository.existsById(id);
    }

}
