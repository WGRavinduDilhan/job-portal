package com.jobportal.dto.auth;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class UserAuthDto extends User implements UserDetails {

    private long userId;
    private CommonUserAuth userDetails;

    public UserAuthDto(long userId, String username, String password, List<SimpleGrantedAuthority> authorities, CommonUserAuth userDetails) {
        super(username, password, authorities);
        this.userId = userId;
        this.userDetails = userDetails;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public CommonUserAuth getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(CommonUserAuth userDetails) {
        this.userDetails = userDetails;
    }

    @Override
    public String getUsername() {
        return super.getUsername();
    }

    @Override
    public String getPassword() {
        return super.getPassword();
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public String toString() {
        return "UserAuthDto{" +
                "userId=" + userId +
                ", userDetails=" + userDetails +
                "} " + super.toString();
    }
}
