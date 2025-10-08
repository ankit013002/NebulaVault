package com.nebulavault.user_service.user;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final UserRepository userRepo;

    public UserService(UserRepository userRepo){
        this.userRepo = userRepo;
    }

    @Transactional
    public User bootstrap(String authSub, String email, String name){
        return userRepo.findByAuthSub(authSub).map(user -> {
            boolean dirty = false;
            if(email != null && !email.equals(user.getEmail())){
                user.setEmail(email);
                dirty = true;
            }
            if(name != null && !name.equals(user.getName())){
                user.setName(name);
                dirty = true;
            }
            return dirty ? userRepo.save(user) : user;
        }).orElseGet(() -> userRepo.save(new User(authSub, email, name)));
    }

    public User meByAuthSub(String authSub){
        return userRepo.findByAuthSub(authSub).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not Found"));
    }
}
